/// Modelos del dominio ganadero.
///
/// Las enumeraciones replican los dominios categóricos del documento
/// «05 - Diagrama de base de datos». Se almacena el valor en texto, tal como
/// lo define el esquema, de modo que un cambio de orden en el código no altere
/// el significado de los datos ya guardados en el dispositivo.
library;

enum Sexo {
  macho('M', 'Macho'),
  hembra('H', 'Hembra');

  const Sexo(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static Sexo desde(String v) =>
      Sexo.values.firstWhere((e) => e.valor == v, orElse: () => Sexo.macho);
}

enum CategoriaAnimal {
  ternero('ternero', 'Ternero'),
  vaquillona('vaquillona', 'Vaquillona'),
  novillo('novillo', 'Novillo'),
  vaca('vaca', 'Vaca'),
  toro('toro', 'Toro');

  const CategoriaAnimal(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static CategoriaAnimal desde(String v) => CategoriaAnimal.values
      .firstWhere((e) => e.valor == v, orElse: () => CategoriaAnimal.ternero);

  /// Categorías coherentes con el sexo del animal, para no ofrecer en el
  /// formulario combinaciones que el dominio no admite.
  static List<CategoriaAnimal> segunSexo(Sexo sexo) => sexo == Sexo.macho
      ? const [ternero, novillo, toro]
      : const [ternero, vaquillona, vaca];
}

enum FaseManejo {
  crianza('crianza', 'Crianza'),
  destete('destete', 'Destete'),
  engorde('engorde', 'Engorde');

  const FaseManejo(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static FaseManejo desde(String v) => FaseManejo.values
      .firstWhere((e) => e.valor == v, orElse: () => FaseManejo.crianza);
}

enum EstadoAnimal {
  activo('activo', 'Activo'),
  vendido('vendido', 'Vendido'),
  baja('baja', 'Baja');

  const EstadoAnimal(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static EstadoAnimal desde(String v) => EstadoAnimal.values
      .firstWhere((e) => e.valor == v, orElse: () => EstadoAnimal.activo);
}

/// Estado de sincronización del registro local.
///
/// Corresponde al dominio de la columna `estado_sync` del diseño. Vive en el
/// dispositivo y en la bitácora del servidor.
enum EstadoSync {
  /// Creado o modificado sin conexión, pendiente de consolidar.
  pendiente('pendiente'),

  /// Confirmado por el servidor.
  sincronizado('sincronizado'),

  /// La consolidación falló de forma no recuperable y requiere que el usuario
  /// resuelva la divergencia.
  conflicto('conflicto');

  const EstadoSync(this.valor);
  final String valor;

  static EstadoSync desde(String v) => EstadoSync.values
      .firstWhere((e) => e.valor == v, orElse: () => EstadoSync.pendiente);
}

/// Tipos de evento sanitario que se registran por animal.
enum TipoEventoSanitario {
  vacunacion('vacunacion', 'Vacunación'),
  desparasitacion('desparasitacion', 'Desparasitación'),
  tratamiento('tratamiento', 'Tratamiento'),
  diagnostico('diagnostico', 'Diagnóstico');

  const TipoEventoSanitario(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static TipoEventoSanitario desde(String v) => TipoEventoSanitario.values
      .firstWhere((e) => e.valor == v, orElse: () => TipoEventoSanitario.tratamiento);

  /// Un diagnóstico se registra porque ocurrió, no porque estuviera previsto,
  /// de modo que no cierra ninguna tarea del calendario.
  bool get cumpleProtocolo => this != TipoEventoSanitario.diagnostico;
}

enum TipoAlerta {
  sanitaria('sanitaria', 'Sanitaria'),
  reproductiva('reproductiva', 'Reproductiva');

  const TipoAlerta(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static TipoAlerta desde(String v) => TipoAlerta.values
      .firstWhere((e) => e.valor == v, orElse: () => TipoAlerta.sanitaria);
}

enum EstadoAlerta {
  pendiente('pendiente', 'Pendiente'),
  atendida('atendida', 'Atendida'),
  vencida('vencida', 'Vencida');

  const EstadoAlerta(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static EstadoAlerta desde(String v) => EstadoAlerta.values
      .firstWhere((e) => e.valor == v, orElse: () => EstadoAlerta.pendiente);

  bool get estaAbierta => this != EstadoAlerta.atendida;
}

enum Rol {
  administrador('administrador', 'Administrador'),
  personalCampo('personal_campo', 'Personal de campo'),
  veterinario('veterinario', 'Veterinario'),
  propietario('propietario', 'Propietario');

  const Rol(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static Rol desde(String v) => Rol.values
      .firstWhere((e) => e.valor == v, orElse: () => Rol.personalCampo);

  /// El veterinario consulta el hato y registra eventos sanitarios, pero no
  /// da de alta ni modifica animales.
  bool get puedeEditarAnimales => this != Rol.veterinario;

  /// El pesaje lo toma quien está con el animal: personal de campo,
  /// propietario o administrador. El veterinario atiende la sanidad.
  bool get puedeRegistrarPesajes => this != Rol.veterinario;

  /// La sanidad la registran todos los roles: el personal de campo aplica la
  /// mayoría de las vacunas de rutina en un establecimiento sin veterinario
  /// de planta, que es la situación habitual en la zona.
  bool get puedeRegistrarSanidad => true;
}

class Usuario {
  const Usuario({
    required this.idUsuario,
    required this.email,
    required this.nombre,
    required this.rol,
  });

  final String idUsuario;
  final String email;
  final String nombre;
  final Rol rol;

  factory Usuario.desdeJson(Map<String, dynamic> json) => Usuario(
        idUsuario: json['idUsuario'] as String,
        email: json['email'] as String,
        nombre: json['nombre'] as String? ?? '',
        rol: Rol.desde(json['rol'] as String),
      );
}
