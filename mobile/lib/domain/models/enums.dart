/// Modelos del dominio ganadero.
///
/// Las enumeraciones replican las del servidor. Se almacena el nombre en
/// texto (no el índice) para que un cambio de orden en el código no altere
/// el significado de los datos ya guardados en el dispositivo.
library;

enum Sexo {
  macho('MACHO', 'Macho'),
  hembra('HEMBRA', 'Hembra');

  const Sexo(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static Sexo desde(String v) =>
      Sexo.values.firstWhere((e) => e.valor == v, orElse: () => Sexo.macho);
}

enum CategoriaAnimal {
  ternero('TERNERO', 'Ternero'),
  ternera('TERNERA', 'Ternera'),
  novillo('NOVILLO', 'Novillo'),
  vaquilla('VAQUILLA', 'Vaquilla'),
  toro('TORO', 'Toro'),
  vaca('VACA', 'Vaca'),
  buey('BUEY', 'Buey');

  const CategoriaAnimal(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static CategoriaAnimal desde(String v) => CategoriaAnimal.values
      .firstWhere((e) => e.valor == v, orElse: () => CategoriaAnimal.ternero);

  /// Categorías coherentes con el sexo del animal, para no ofrecer
  /// combinaciones imposibles en el formulario de registro.
  static List<CategoriaAnimal> segunSexo(Sexo sexo) => sexo == Sexo.macho
      ? [ternero, novillo, toro, buey]
      : [ternera, vaquilla, vaca];
}

enum FaseProductiva {
  crianza('CRIANZA', 'Crianza'),
  destete('DESTETE', 'Destete'),
  engorde('ENGORDE', 'Engorde');

  const FaseProductiva(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static FaseProductiva desde(String v) => FaseProductiva.values
      .firstWhere((e) => e.valor == v, orElse: () => FaseProductiva.crianza);
}

enum EstadoAnimal {
  activo('ACTIVO', 'Activo'),
  vendido('VENDIDO', 'Vendido'),
  muerto('MUERTO', 'Muerto'),
  extraviado('EXTRAVIADO', 'Extraviado');

  const EstadoAnimal(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static EstadoAnimal desde(String v) => EstadoAnimal.values
      .firstWhere((e) => e.valor == v, orElse: () => EstadoAnimal.activo);
}

/// Estado de sincronización del registro local.
///
/// Vive únicamente en el dispositivo: el servidor no lo conoce ni lo necesita.
enum EstadoSync {
  /// Creado o modificado sin conexión, pendiente de envío.
  pendiente('PENDIENTE'),

  /// Confirmado por el servidor.
  sincronizado('SINCRONIZADO'),

  /// El envío falló de forma no recuperable y requiere intervención.
  conflicto('CONFLICTO');

  const EstadoSync(this.valor);
  final String valor;

  static EstadoSync desde(String v) => EstadoSync.values
      .firstWhere((e) => e.valor == v, orElse: () => EstadoSync.pendiente);
}

enum Rol {
  administrador('ADMINISTRADOR', 'Administrador'),
  propietario('PROPIETARIO', 'Propietario'),
  personalCampo('PERSONAL_CAMPO', 'Personal de campo'),
  veterinario('VETERINARIO', 'Veterinario');

  const Rol(this.valor, this.etiqueta);
  final String valor;
  final String etiqueta;

  static Rol desde(String v) => Rol.values
      .firstWhere((e) => e.valor == v, orElse: () => Rol.personalCampo);

  /// El veterinario consulta el hato pero no registra ni modifica animales.
  bool get puedeEditarAnimales => this != Rol.veterinario;
}

class Usuario {
  const Usuario({
    required this.id,
    required this.email,
    required this.nombre,
    required this.rol,
    this.predioId,
  });

  final String id;
  final String email;
  final String nombre;
  final Rol rol;
  final String? predioId;

  factory Usuario.desdeJson(Map<String, dynamic> json) => Usuario(
        id: json['id'] as String,
        email: json['email'] as String,
        nombre: json['nombre'] as String? ?? '',
        rol: Rol.desde(json['rol'] as String),
        predioId: json['predioId'] as String?,
      );
}
