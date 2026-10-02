import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ganabol/data/local/database.dart';

/// Pruebas de la base local para pesaje y sanidad (RF4, RF5, RF13).
///
/// Se ejecutan contra SQLite en memoria. Lo que se comprueba no es que Drift
/// sepa guardar filas, sino las reglas que el dispositivo tiene que sostener
/// por sí mismo cuando no hay conexión: que lo capturado quede pendiente de
/// consolidar, que el historial se devuelva en el orden en que se consulta y
/// que la alerta correspondiente se cierre en el momento de registrar el
/// evento, sin esperar al servidor.
void main() {
  late BaseDatosLocal db;

  const animalA = '01AAAAAAAAAAAAAAAAAAAAAAAA';
  const animalB = '01BBBBBBBBBBBBBBBBBBBBBBBB';
  const planAftosa = '01PLANAFTOSAAFTOSAAFTOSAAA';
  const planDesparas = '01PLANDESPARASDESPARASDESS';

  AnimalesCompanion animal(String id, String caravana,
          {String categoria = 'novillo'}) =>
      AnimalesCompanion.insert(
        idAnimal: id,
        idUsuario: '01USUARIOUSUARIOUSUARIOUS1',
        caravana: caravana,
        categoria: categoria,
        sexo: 'M',
        fase: 'engorde',
      );

  PesajesCompanion pesaje(
    String id,
    String idAnimal,
    DateTime fecha, {
    required double pt,
    required double lc,
    required double peso,
  }) =>
      PesajesCompanion.insert(
        idPesaje: id,
        idAnimal: idAnimal,
        fecha: fecha,
        perimetroToracico: pt,
        largoCorporal: lc,
        pesoEstimado: peso,
        constante: 10838,
      );

  PlanesSanitariosCompanion plan(
    String id,
    String nombre,
    String tipo,
    int dias, {
    String? categoria,
  }) =>
      PlanesSanitariosCompanion.insert(
        idPlan: id,
        nombre: nombre,
        tipoEvento: tipo,
        periodicidadDias: dias,
        categoria: Value(categoria),
      );

  AlertasCompanion alerta(
    String id,
    String idAnimal,
    String idPlan,
    DateTime programada, {
    String estado = 'pendiente',
  }) =>
      AlertasCompanion.insert(
        idAlerta: id,
        idAnimal: idAnimal,
        idPlan: Value(idPlan),
        tipo: 'sanitaria',
        fechaProgramada: programada,
        estado: Value(estado),
      );

  setUp(() async {
    db = BaseDatosLocal(NativeDatabase.memory());
    await db.guardarAnimal(animal(animalA, 'A-101'));
    await db.guardarAnimal(animal(animalB, 'A-102'));
  });

  tearDown(() => db.close());

  group('pesaje', () {
    test('un pesaje registrado queda pendiente de consolidar', () async {
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));

      final pendientes = await db.pesajesPendientes();
      expect(pendientes, hasLength(1));
      expect(pendientes.first.pesoEstimado, 408.71);
      expect(pendientes.first.estadoSync, 'pendiente');
    });

    test('conserva las medidas además del peso', () async {
      // Guardar solo el resultado impediría recalcular el historial si la
      // constante se recalibra, que es lo que el diseño prevé.
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));

      final historial = await db.observarPesajes(animalA).first;
      expect(historial.first.perimetroToracico, 176);
      expect(historial.first.largoCorporal, 143);
      expect(historial.first.constante, 10838);
    });

    test('el historial se devuelve del más reciente al más antiguo', () async {
      await db.guardarPesajes([
        pesaje('01PESAJE1PESAJE1PESAJE1PEE', animalA,
            DateTime.utc(2026, 6, 4), pt: 158, lc: 131, peso: 301.74),
        pesaje('01PESAJE3PESAJE3PESAJE3PEE', animalA,
            DateTime.utc(2026, 9, 27), pt: 176, lc: 143, peso: 408.71),
        pesaje('01PESAJE2PESAJE2PESAJE2PEE', animalA,
            DateTime.utc(2026, 8, 3), pt: 168, lc: 138, peso: 359.38),
      ]);

      final historial = await db.observarPesajes(animalA).first;

      expect(
        historial.map((p) => p.pesoEstimado).toList(),
        [408.71, 359.38, 301.74],
      );
    });

    test('el historial de un animal no incluye los pesajes de otro', () async {
      await db.guardarPesajes([
        pesaje('01PESAJE1PESAJE1PESAJE1PEE', animalA,
            DateTime.utc(2026, 9, 27), pt: 176, lc: 143, peso: 408.71),
        pesaje('01PESAJE2PESAJE2PESAJE2PEE', animalB,
            DateTime.utc(2026, 9, 27), pt: 150, lc: 125, peso: 259.5),
      ]);

      final deA = await db.observarPesajes(animalA).first;
      expect(deA, hasLength(1));
      expect(deA.first.idAnimal, animalA);
    });

    test('un pesaje dado de baja desaparece del historial', () async {
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));
      await (db.update(db.pesajes)
            ..where((p) => p.idPesaje.equals('01PESAJE1PESAJE1PESAJE1PEE')))
          .write(const PesajesCompanion(eliminado: Value(true)));

      expect(await db.observarPesajes(animalA).first, isEmpty);
    });

    test('el último peso de cada animal se resuelve en una sola consulta',
        () async {
      await db.guardarPesajes([
        pesaje('01PESAJE1PESAJE1PESAJE1PEE', animalA,
            DateTime.utc(2026, 6, 4), pt: 158, lc: 131, peso: 301.74),
        pesaje('01PESAJE2PESAJE2PESAJE2PEE', animalA,
            DateTime.utc(2026, 9, 27), pt: 176, lc: 143, peso: 408.71),
        pesaje('01PESAJE3PESAJE3PESAJE3PEE', animalB,
            DateTime.utc(2026, 9, 14), pt: 214, lc: 176, peso: 743.69),
      ]);

      final ultimos = await db.observarUltimoPeso().first;

      expect(ultimos[animalA], 408.71);
      expect(ultimos[animalB], 743.69);
    });
  });

  group('historial sanitario', () {
    test('un evento registrado queda pendiente de consolidar', () async {
      await db.guardarEvento(EventosSanitariosCompanion.insert(
        idEvento: '01EVENTO1EVENTO1EVENTO1EVV',
        idAnimal: animalA,
        tipo: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        producto: const Value('Aftogan bivalente'),
      ));

      final pendientes = await db.eventosPendientes();
      expect(pendientes, hasLength(1));
      expect(pendientes.first.producto, 'Aftogan bivalente');
      expect(pendientes.first.estadoSync, 'pendiente');
    });

    test('el historial se devuelve del evento más reciente al más antiguo',
        () async {
      await db.guardarEventos([
        EventosSanitariosCompanion.insert(
          idEvento: '01EVENTO1EVENTO1EVENTO1EVV',
          idAnimal: animalA,
          tipo: 'vacunacion',
          fecha: DateTime.utc(2026, 3, 16),
        ),
        EventosSanitariosCompanion.insert(
          idEvento: '01EVENTO2EVENTO2EVENTO2EVV',
          idAnimal: animalA,
          tipo: 'desparasitacion',
          fecha: DateTime.utc(2026, 10, 2),
        ),
      ]);

      final historial = await db.observarEventos(animalA).first;
      expect(historial.first.tipo, 'desparasitacion');
      expect(historial.last.tipo, 'vacunacion');
    });
  });

  group('calendario de alertas', () {
    setUp(() async {
      await db.guardarPlanes([
        plan(planAftosa, 'Vacunación antiaftosa', 'vacunacion', 180),
        plan(planDesparas, 'Desparasitación interna', 'desparasitacion', 120),
      ]);
    });

    test('la bandeja muestra las abiertas con la caravana del animal',
        () async {
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 9, 12), estado: 'vencida'),
        alerta('01ALERTA2ALERTA2ALERTA2ALL', animalB, planDesparas,
            DateTime.utc(2026, 10, 27)),
      ]);

      final bandeja = await db.observarAlertasAbiertas().first;

      expect(bandeja, hasLength(2));
      // Ordenadas por vencimiento: la más urgente primero.
      expect(bandeja.first.alerta.estado, 'vencida');
      expect(bandeja.first.animal.caravana, 'A-101');
      expect(bandeja.last.animal.caravana, 'A-102');
    });

    test('la bandeja excluye las alertas ya atendidas', () async {
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 9, 12), estado: 'atendida'),
        alerta('01ALERTA2ALERTA2ALERTA2ALL', animalB, planDesparas,
            DateTime.utc(2026, 10, 27)),
      ]);

      final bandeja = await db.observarAlertasAbiertas().first;
      expect(bandeja, hasLength(1));
      expect(bandeja.first.animal.caravana, 'A-102');
    });

    test('registrar el evento del protocolo cierra su alerta', () async {
      // Es el criterio de aceptación del requisito: la tarea desaparece de la
      // bandeja al registrarse el evento, y aquí ocurre sin red.
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 9, 12), estado: 'vencida'),
      ]);

      final cerradas = await db.atenderAlertasDe(
        idAnimal: animalA,
        idPlan: planAftosa,
        tipoEvento: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        ventanaDias: 30,
      );

      expect(cerradas, 1);
      expect(await db.observarAlertasAbiertas().first, isEmpty);
    });

    test('cierra solo la alerta del protocolo indicado', () async {
      // Dos protocolos de vacunación sobre el mismo animal: aplicar uno no
      // debe dar por cumplido el otro. Es el defecto que motivó agregar la
      // referencia del evento al protocolo.
      const planCarbunclo = '01PLANCARBUNCLOCARBUNCLOCC';
      await db.guardarPlanes([
        plan(planCarbunclo, 'Vacunación contra carbunclo', 'vacunacion', 365),
      ]);
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 10, 5)),
        alerta('01ALERTA2ALERTA2ALERTA2ALL', animalA, planCarbunclo,
            DateTime.utc(2026, 10, 8)),
      ]);

      await db.atenderAlertasDe(
        idAnimal: animalA,
        idPlan: planAftosa,
        tipoEvento: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        ventanaDias: 30,
      );

      final abiertas = await db.observarAlertasAbiertas().first;
      expect(abiertas, hasLength(1));
      expect(abiertas.first.alerta.idPlan, planCarbunclo);
    });

    test('un evento sin protocolo cierra las alertas de su mismo tipo',
        () async {
      // El productor que anota «vacuné a este animal» sin precisar contra qué
      // aportó información: lo más fiel que puede inferirse es el tipo.
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 10, 5)),
        alerta('01ALERTA2ALERTA2ALERTA2ALL', animalA, planDesparas,
            DateTime.utc(2026, 10, 9)),
      ]);

      await db.atenderAlertasDe(
        idAnimal: animalA,
        idPlan: null,
        tipoEvento: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        ventanaDias: 30,
      );

      final abiertas = await db.observarAlertasAbiertas().first;
      expect(abiertas, hasLength(1));
      expect(abiertas.first.alerta.idPlan, planDesparas);
    });

    test('no cierra el vencimiento del ciclo siguiente', () async {
      // Una alerta a 200 días queda fuera de la ventana de anticipación: la
      // vacuna de hoy no puede darla por cumplida.
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2027, 4, 20)),
      ]);

      final cerradas = await db.atenderAlertasDe(
        idAnimal: animalA,
        idPlan: planAftosa,
        tipoEvento: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        ventanaDias: 30,
      );

      expect(cerradas, 0);
      expect(await db.observarAlertasAbiertas().first, hasLength(1));
    });

    test('no cierra las alertas de otro animal', () async {
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 10, 5)),
        alerta('01ALERTA2ALERTA2ALERTA2ALL', animalB, planAftosa,
            DateTime.utc(2026, 10, 5)),
      ]);

      await db.atenderAlertasDe(
        idAnimal: animalA,
        idPlan: planAftosa,
        tipoEvento: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
        ventanaDias: 30,
      );

      final abiertas = await db.observarAlertasAbiertas().first;
      expect(abiertas, hasLength(1));
      expect(abiertas.first.animal.caravana, 'A-102');
    });
  });

  group('indicador de pendientes', () {
    test('suma los pendientes de todas las entidades', () async {
      // El número que ve el usuario es cuánto de su trabajo todavía no llegó
      // al servidor, sin importar de qué tabla sale.
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));
      await db.guardarEvento(EventosSanitariosCompanion.insert(
        idEvento: '01EVENTO1EVENTO1EVENTO1EVV',
        idAnimal: animalA,
        tipo: 'vacunacion',
        fecha: DateTime.utc(2026, 10, 2),
      ));

      // Dos animales del setUp, más un pesaje y un evento.
      expect(await db.contarPendientes(), 4);
    });

    test('lo consolidado deja de contarse', () async {
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));
      await db.marcarPesajeSincronizado('01PESAJE1PESAJE1PESAJE1PEE');

      expect(await db.pesajesPendientes(), isEmpty);
    });
  });

  group('cierre de sesión', () {
    test('vacía también las entidades nuevas', () async {
      // Los datos del establecimiento no deben quedar accesibles para el
      // siguiente usuario del dispositivo.
      await db.guardarPlanes([
        plan(planAftosa, 'Vacunación antiaftosa', 'vacunacion', 180),
      ]);
      await db.guardarPesaje(pesaje(
        '01PESAJE1PESAJE1PESAJE1PEE',
        animalA,
        DateTime.utc(2026, 9, 27),
        pt: 176,
        lc: 143,
        peso: 408.71,
      ));
      await db.guardarAlertas([
        alerta('01ALERTA1ALERTA1ALERTA1ALL', animalA, planAftosa,
            DateTime.utc(2026, 10, 5)),
      ]);

      await db.limpiar();

      expect(await db.observarPesajes(animalA).first, isEmpty);
      expect(await db.observarPlanes().first, isEmpty);
      expect(await db.observarAlertasAbiertas().first, isEmpty);
      expect(await db.contarPendientes(), 0);
    });
  });
}
