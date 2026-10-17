using System;
using System.Collections.Generic;
using LaguitoLibre.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.Api.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Adquiere> Adquieres { get; set; }

    public virtual DbSet<Averigua> Averiguas { get; set; }

    public virtual DbSet<Calificacion> Calificacions { get; set; }

    public virtual DbSet<Carrito> Carritos { get; set; }

    public virtual DbSet<Categorium> Categoria { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Codigopostal> Codigopostals { get; set; }

    public virtual DbSet<Compra> Compras { get; set; }

    public virtual DbSet<Comuna> Comunas { get; set; }

    public virtual DbSet<Consultum> Consulta { get; set; }

    public virtual DbSet<Contestum> Contesta { get; set; }

    public virtual DbSet<Contiene> Contienes { get; set; }

    public virtual DbSet<Correo> Correos { get; set; }

    public virtual DbSet<Cotizacion> Cotizacions { get; set; }

    public virtual DbSet<Descuentum> Descuenta { get; set; }

    public virtual DbSet<Despacho> Despachos { get; set; }

    public virtual DbSet<Devolucion> Devolucions { get; set; }

    public virtual DbSet<Devuelve> Devuelves { get; set; }

    public virtual DbSet<Direccion> Direccions { get; set; }

    public virtual DbSet<Emprendedor> Emprendedors { get; set; }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<Empresatransporte> Empresatransportes { get; set; }

    public virtual DbSet<Evalua> Evaluas { get; set; }

    public virtual DbSet<Interactua> Interactuas { get; set; }

    public virtual DbSet<Inventario> Inventarios { get; set; }

    public virtual DbSet<Mensaje> Mensajes { get; set; }

    public virtual DbSet<Metodopago> Metodopagos { get; set; }

    public virtual DbSet<Ofertum> Oferta { get; set; }

    public virtual DbSet<Preguntum> Pregunta { get; set; }

    public virtual DbSet<Produce> Produces { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Provincium> Provincia { get; set; }

    public virtual DbSet<Rebaja> Rebajas { get; set; }

    public virtual DbSet<Region> Regions { get; set; }

    public virtual DbSet<Responde> Respondes { get; set; }

    public virtual DbSet<Respuestum> Respuesta { get; set; }

    public virtual DbSet<Servicio> Servicios { get; set; }

    public virtual DbSet<Telefono> Telefonos { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Adquiere>(entity =>
        {
            entity.HasKey(e => new { e.VentaId, e.ServicioId }).HasName("adquiere_pkey");

            entity.ToTable("adquiere");

            entity.HasIndex(e => e.ClienteId, "idx_adquiere_cliente");

            entity.HasIndex(e => e.ServicioId, "idx_adquiere_servicio");

            entity.Property(e => e.VentaId).HasColumnName("venta_id");
            entity.Property(e => e.ServicioId).HasColumnName("servicio_id");
            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.Fecha)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Adquieres)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("adquiere_cliente_id_fkey");

            entity.HasOne(d => d.Servicio).WithMany(p => p.Adquieres)
                .HasForeignKey(d => d.ServicioId)
                .HasConstraintName("adquiere_servicio_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Adquieres)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("adquiere_venta_id_fkey");
        });

        modelBuilder.Entity<Averigua>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.PreguntaId, e.ServicioId }).HasName("averigua_pkey");

            entity.ToTable("averigua");

            entity.HasIndex(e => e.ServicioId, "idx_averigua_servicio");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.PreguntaId).HasColumnName("pregunta_id");
            entity.Property(e => e.ServicioId).HasColumnName("servicio_id");

            entity.HasOne(d => d.Pregunta).WithMany(p => p.Averiguas)
                .HasForeignKey(d => d.PreguntaId)
                .HasConstraintName("averigua_pregunta_id_fkey");

            entity.HasOne(d => d.Servicio).WithMany(p => p.Averiguas)
                .HasForeignKey(d => d.ServicioId)
                .HasConstraintName("averigua_servicio_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Averiguas)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("averigua_usuario_id_fkey");
        });

        modelBuilder.Entity<Calificacion>(entity =>
        {
            entity.HasKey(e => e.Idcalificacion).HasName("calificacion_pkey");

            entity.ToTable("calificacion");

            entity.Property(e => e.Idcalificacion).HasColumnName("idcalificacion");
            entity.Property(e => e.Comentario)
                .HasMaxLength(300)
                .HasColumnName("comentario");
            entity.Property(e => e.Puntuacion).HasColumnName("puntuacion");
        });

        modelBuilder.Entity<Carrito>(entity =>
        {
            entity.HasKey(e => e.Iditem).HasName("carrito_pkey");

            entity.ToTable("carrito");

            entity.HasIndex(e => new { e.ClienteId, e.ProductoId, e.InventarioId }, "carrito_cliente_id_producto_id_inventario_id_key").IsUnique();

            entity.Property(e => e.Iditem).HasColumnName("iditem");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.InventarioId).HasColumnName("inventario_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Carritos)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("carrito_cliente_id_fkey");

            entity.HasOne(d => d.Contiene).WithMany(p => p.Carritos)
                .HasForeignKey(d => new { d.InventarioId, d.ProductoId })
                .HasConstraintName("carrito_inventario_id_producto_id_fkey");
        });

        modelBuilder.Entity<Categorium>(entity =>
        {
            entity.HasKey(e => e.Idcategoria).HasName("categoria_pkey");

            entity.ToTable("categoria");

            entity.Property(e => e.Idcategoria).HasColumnName("idcategoria");
            entity.Property(e => e.CategoriapadreId).HasColumnName("categoriapadre_id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .HasColumnName("nombre");

            entity.HasOne(d => d.Categoriapadre).WithMany(p => p.InverseCategoriapadre)
                .HasForeignKey(d => d.CategoriapadreId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("categoria_categoriapadre_id_fkey");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("cliente_pkey");

            entity.ToTable("cliente");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.Descuento)
                .HasPrecision(3, 2)
                .HasColumnName("descuento");
            entity.Property(e => e.Fechadescuento).HasColumnName("fechadescuento");

            entity.HasOne(d => d.Usuario).WithOne(p => p.Cliente)
                .HasForeignKey<Cliente>(d => d.UsuarioId)
                .HasConstraintName("cliente_usuario_id_fkey");

            entity.HasMany(d => d.Productos).WithMany(p => p.Clientes)
                .UsingEntity<Dictionary<string, object>>(
                    "Desea",
                    r => r.HasOne<Producto>().WithMany()
                        .HasForeignKey("ProductoId")
                        .HasConstraintName("desea_producto_id_fkey"),
                    l => l.HasOne<Cliente>().WithMany()
                        .HasForeignKey("ClienteId")
                        .HasConstraintName("desea_cliente_id_fkey"),
                    j =>
                    {
                        j.HasKey("ClienteId", "ProductoId").HasName("desea_pkey");
                        j.ToTable("desea");
                        j.IndexerProperty<string>("ClienteId")
                            .HasMaxLength(10)
                            .HasColumnName("cliente_id");
                        j.IndexerProperty<int>("ProductoId").HasColumnName("producto_id");
                    });

            entity.HasMany(d => d.Servicios).WithMany(p => p.Clientes)
                .UsingEntity<Dictionary<string, object>>(
                    "Quiere",
                    r => r.HasOne<Servicio>().WithMany()
                        .HasForeignKey("ServicioId")
                        .HasConstraintName("quiere_servicio_id_fkey"),
                    l => l.HasOne<Cliente>().WithMany()
                        .HasForeignKey("ClienteId")
                        .HasConstraintName("quiere_cliente_id_fkey"),
                    j =>
                    {
                        j.HasKey("ClienteId", "ServicioId").HasName("quiere_pkey");
                        j.ToTable("quiere");
                        j.IndexerProperty<string>("ClienteId")
                            .HasMaxLength(10)
                            .HasColumnName("cliente_id");
                        j.IndexerProperty<int>("ServicioId").HasColumnName("servicio_id");
                    });
        });

        modelBuilder.Entity<Codigopostal>(entity =>
        {
            entity.HasKey(e => e.Codigopostal1).HasName("codigopostal_pkey");

            entity.ToTable("codigopostal");

            entity.Property(e => e.Codigopostal1)
                .ValueGeneratedNever()
                .HasColumnName("codigopostal");
            entity.Property(e => e.ComunaId).HasColumnName("comuna_id");

            entity.HasOne(d => d.Comuna).WithMany(p => p.Codigopostals)
                .HasForeignKey(d => d.ComunaId)
                .HasConstraintName("codigopostal_comuna_id_fkey");
        });

        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => new { e.VentaId, e.ProductoId }).HasName("compra_pkey");

            entity.ToTable("compra");

            entity.HasIndex(e => e.ClienteId, "idx_compra_cliente");

            entity.HasIndex(e => e.ProductoId, "idx_compra_producto");

            entity.Property(e => e.VentaId).HasColumnName("venta_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.Fecha)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");
            entity.Property(e => e.Nota)
                .HasMaxLength(150)
                .HasColumnName("nota");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Compras)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("compra_cliente_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Compras)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("compra_producto_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Compras)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("compra_venta_id_fkey");
        });

        modelBuilder.Entity<Comuna>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("comuna_pkey");

            entity.ToTable("comuna");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.IdProvincia).HasColumnName("id_provincia");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Superficie).HasColumnName("superficie");

            entity.HasOne(d => d.IdProvinciaNavigation).WithMany(p => p.Comunas)
                .HasForeignKey(d => d.IdProvincia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("comuna_id_provincia_fkey");
        });

        modelBuilder.Entity<Consultum>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.ProductoId, e.PreguntaId }).HasName("consulta_pkey");

            entity.ToTable("consulta");

            entity.HasIndex(e => e.ProductoId, "idx_consulta_producto");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.PreguntaId).HasColumnName("pregunta_id");

            entity.HasOne(d => d.Pregunta).WithMany(p => p.Consulta)
                .HasForeignKey(d => d.PreguntaId)
                .HasConstraintName("consulta_pregunta_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Consulta)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("consulta_producto_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Consulta)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("consulta_usuario_id_fkey");
        });

        modelBuilder.Entity<Contestum>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.RespuestaId }).HasName("contesta_pkey");

            entity.ToTable("contesta");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.RespuestaId).HasColumnName("respuesta_id");
            entity.Property(e => e.PreguntaId).HasColumnName("pregunta_id");

            entity.HasOne(d => d.Pregunta).WithMany(p => p.Contesta)
                .HasForeignKey(d => d.PreguntaId)
                .HasConstraintName("contesta_pregunta_id_fkey");

            entity.HasOne(d => d.Respuesta).WithMany(p => p.Contesta)
                .HasForeignKey(d => d.RespuestaId)
                .HasConstraintName("contesta_respuesta_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Contesta)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("contesta_usuario_id_fkey");
        });

        modelBuilder.Entity<Contiene>(entity =>
        {
            entity.HasKey(e => new { e.InventarioId, e.ProductoId }).HasName("contiene_pkey");

            entity.ToTable("contiene");

            entity.Property(e => e.InventarioId).HasColumnName("inventario_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Stock).HasColumnName("stock");

            entity.HasOne(d => d.Inventario).WithMany(p => p.Contienes)
                .HasForeignKey(d => d.InventarioId)
                .HasConstraintName("contiene_inventario_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Contienes)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("contiene_producto_id_fkey");
        });

        modelBuilder.Entity<Correo>(entity =>
        {
            entity.HasKey(e => e.Correo1).HasName("correo_pkey");

            entity.ToTable("correo");

            entity.HasIndex(e => e.UsuarioId, "idx_correo_usuario");

            entity.Property(e => e.Correo1)
                .HasMaxLength(50)
                .HasColumnName("correo");
            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Correos)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("correo_usuario_id_fkey");
        });

        modelBuilder.Entity<Cotizacion>(entity =>
        {
            entity.HasKey(e => e.Idcotizacion).HasName("cotizacion_pkey");

            entity.ToTable("cotizacion");

            entity.HasIndex(e => e.ClienteId, "idx_cotizacion_cliente");

            entity.HasIndex(e => e.Estado, "idx_cotizacion_estado");

            entity.Property(e => e.Idcotizacion).HasColumnName("idcotizacion");
            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.Estado)
                .HasMaxLength(25)
                .HasColumnName("estado");
            entity.Property(e => e.Fecha).HasColumnName("fecha");
            entity.Property(e => e.FechaUltimoAjuste).HasColumnName("fecha_ultimo_ajuste");
            entity.Property(e => e.Precio).HasColumnName("precio");
            entity.Property(e => e.Validez).HasColumnName("validez");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Cotizacions)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("cotizacion_cliente_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Cotizacions)
                .HasForeignKey(d => d.VentaId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("cotizacion_venta_id_fkey");

            entity.HasMany(d => d.Productos).WithMany(p => p.Cotizacions)
                .UsingEntity<Dictionary<string, object>>(
                    "Cotiza",
                    r => r.HasOne<Producto>().WithMany()
                        .HasForeignKey("ProductoId")
                        .HasConstraintName("cotiza_producto_id_fkey"),
                    l => l.HasOne<Cotizacion>().WithMany()
                        .HasForeignKey("CotizacionId")
                        .HasConstraintName("cotiza_cotizacion_id_fkey"),
                    j =>
                    {
                        j.HasKey("CotizacionId", "ProductoId").HasName("cotiza_pkey");
                        j.ToTable("cotiza");
                        j.IndexerProperty<int>("CotizacionId").HasColumnName("cotizacion_id");
                        j.IndexerProperty<int>("ProductoId").HasColumnName("producto_id");
                    });

            entity.HasMany(d => d.Servicios).WithMany(p => p.Cotizacions)
                .UsingEntity<Dictionary<string, object>>(
                    "Presupuestum",
                    r => r.HasOne<Servicio>().WithMany()
                        .HasForeignKey("ServicioId")
                        .HasConstraintName("presupuesta_servicio_id_fkey"),
                    l => l.HasOne<Cotizacion>().WithMany()
                        .HasForeignKey("CotizacionId")
                        .HasConstraintName("presupuesta_cotizacion_id_fkey"),
                    j =>
                    {
                        j.HasKey("CotizacionId", "ServicioId").HasName("presupuesta_pkey");
                        j.ToTable("presupuesta");
                        j.IndexerProperty<int>("CotizacionId").HasColumnName("cotizacion_id");
                        j.IndexerProperty<int>("ServicioId").HasColumnName("servicio_id");
                    });
        });

        modelBuilder.Entity<Descuentum>(entity =>
        {
            entity.HasKey(e => new { e.OfertaId, e.ServicioId }).HasName("descuenta_pkey");

            entity.ToTable("descuenta");

            entity.Property(e => e.OfertaId).HasColumnName("oferta_id");
            entity.Property(e => e.ServicioId).HasColumnName("servicio_id");
            entity.Property(e => e.Precio).HasColumnName("precio");

            entity.HasOne(d => d.Oferta).WithMany(p => p.Descuenta)
                .HasForeignKey(d => d.OfertaId)
                .HasConstraintName("descuenta_oferta_id_fkey");

            entity.HasOne(d => d.Servicio).WithMany(p => p.Descuenta)
                .HasForeignKey(d => d.ServicioId)
                .HasConstraintName("descuenta_servicio_id_fkey");
        });

        modelBuilder.Entity<Despacho>(entity =>
        {
            entity.HasKey(e => e.Idseguimiento).HasName("despacho_pkey");

            entity.ToTable("despacho");

            entity.HasIndex(e => e.Estadoenvio, "idx_despacho_estado");

            entity.Property(e => e.Idseguimiento).HasColumnName("idseguimiento");
            entity.Property(e => e.Costoenvioproyectado).HasColumnName("costoenvioproyectado");
            entity.Property(e => e.DireccionId).HasColumnName("direccion_id");
            entity.Property(e => e.EmpresatransporteId)
                .HasMaxLength(10)
                .HasColumnName("empresatransporte_id");
            entity.Property(e => e.Estadoenvio)
                .HasMaxLength(20)
                .HasColumnName("estadoenvio");
            entity.Property(e => e.Fechallegada)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fechallegada");
            entity.Property(e => e.Fechasalida)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fechasalida");

            entity.HasOne(d => d.Direccion).WithMany(p => p.Despachos)
                .HasForeignKey(d => d.DireccionId)
                .HasConstraintName("despacho_direccion_id_fkey");

            entity.HasOne(d => d.Empresatransporte).WithMany(p => p.Despachos)
                .HasForeignKey(d => d.EmpresatransporteId)
                .HasConstraintName("despacho_empresatransporte_id_fkey");
        });

        modelBuilder.Entity<Devolucion>(entity =>
        {
            entity.HasKey(e => e.Iddevolucion).HasName("devolucion_pkey");

            entity.ToTable("devolucion");

            entity.Property(e => e.Iddevolucion).HasColumnName("iddevolucion");
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.Montoreembolso).HasColumnName("montoreembolso");
            entity.Property(e => e.Motivo)
                .HasMaxLength(100)
                .HasColumnName("motivo");
        });

        modelBuilder.Entity<Devuelve>(entity =>
        {
            entity.HasKey(e => new { e.ProductoId, e.DevolucionId }).HasName("devuelve_pkey");

            entity.ToTable("devuelve");

            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.DevolucionId).HasColumnName("devolucion_id");
            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.Fecha).HasColumnName("fecha");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Devuelves)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("devuelve_cliente_id_fkey");

            entity.HasOne(d => d.Devolucion).WithMany(p => p.Devuelves)
                .HasForeignKey(d => d.DevolucionId)
                .HasConstraintName("devuelve_devolucion_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Devuelves)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("devuelve_producto_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Devuelves)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("devuelve_venta_id_fkey");
        });

        modelBuilder.Entity<Direccion>(entity =>
        {
            entity.HasKey(e => e.Iddireccion).HasName("direccion_pkey");

            entity.ToTable("direccion");

            entity.Property(e => e.Iddireccion).HasColumnName("iddireccion");
            entity.Property(e => e.Calle)
                .HasMaxLength(30)
                .HasColumnName("calle");
            entity.Property(e => e.Codigopostal).HasColumnName("codigopostal");
            entity.Property(e => e.Departamento)
                .HasMaxLength(5)
                .HasColumnName("departamento");
            entity.Property(e => e.Numero).HasColumnName("numero");

            entity.HasOne(d => d.CodigopostalNavigation).WithMany(p => p.Direccions)
                .HasForeignKey(d => d.Codigopostal)
                .HasConstraintName("direccion_codigopostal_fkey");
        });

        modelBuilder.Entity<Emprendedor>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("emprendedor_pkey");

            entity.ToTable("emprendedor");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.EmpresaId)
                .HasMaxLength(10)
                .HasColumnName("empresa_id");
            entity.Property(e => e.Paginaweb)
                .HasMaxLength(100)
                .HasColumnName("paginaweb");

            entity.HasOne(d => d.Empresa).WithMany(p => p.Emprendedors)
                .HasForeignKey(d => d.EmpresaId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("emprendedor_empresa_id_fkey");

            entity.HasOne(d => d.Usuario).WithOne(p => p.Emprendedor)
                .HasForeignKey<Emprendedor>(d => d.UsuarioId)
                .HasConstraintName("emprendedor_usuario_id_fkey");
        });

        modelBuilder.Entity<Empresa>(entity =>
        {
            entity.HasKey(e => e.Rut).HasName("empresa_pkey");

            entity.ToTable("empresa");

            entity.Property(e => e.Rut)
                .HasMaxLength(10)
                .HasColumnName("rut");
            entity.Property(e => e.Direccionlocal)
                .HasMaxLength(100)
                .HasColumnName("direccionlocal");
            entity.Property(e => e.Giro)
                .HasMaxLength(50)
                .HasColumnName("giro");
            entity.Property(e => e.Paginaweb)
                .HasMaxLength(100)
                .HasColumnName("paginaweb");
            entity.Property(e => e.Razonsocial)
                .HasMaxLength(50)
                .HasColumnName("razonsocial");
        });

        modelBuilder.Entity<Empresatransporte>(entity =>
        {
            entity.HasKey(e => e.Rut).HasName("empresatransporte_pkey");

            entity.ToTable("empresatransporte");

            entity.Property(e => e.Rut)
                .HasMaxLength(10)
                .HasColumnName("rut");
            entity.Property(e => e.Razonsocial)
                .HasMaxLength(50)
                .HasColumnName("razonsocial");
            entity.Property(e => e.Telefonocontacto).HasColumnName("telefonocontacto");

            entity.HasMany(d => d.Empresas).WithMany(p => p.Empresatransportes)
                .UsingEntity<Dictionary<string, object>>(
                    "Contratum",
                    r => r.HasOne<Empresa>().WithMany()
                        .HasForeignKey("EmpresaId")
                        .HasConstraintName("contrata_empresa_id_fkey"),
                    l => l.HasOne<Empresatransporte>().WithMany()
                        .HasForeignKey("EmpresatransporteId")
                        .HasConstraintName("contrata_empresatransporte_id_fkey"),
                    j =>
                    {
                        j.HasKey("EmpresatransporteId", "EmpresaId").HasName("contrata_pkey");
                        j.ToTable("contrata");
                        j.IndexerProperty<string>("EmpresatransporteId")
                            .HasMaxLength(10)
                            .HasColumnName("empresatransporte_id");
                        j.IndexerProperty<string>("EmpresaId")
                            .HasMaxLength(10)
                            .HasColumnName("empresa_id");
                    });
        });

        modelBuilder.Entity<Evalua>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.CalificacionId, e.VentaId, e.ServicioId }).HasName("evalua_pkey");

            entity.ToTable("evalua");

            entity.HasIndex(e => e.ServicioId, "idx_evalua_servicio");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.CalificacionId).HasColumnName("calificacion_id");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");
            entity.Property(e => e.ServicioId).HasColumnName("servicio_id");

            entity.HasOne(d => d.Calificacion).WithMany(p => p.Evaluas)
                .HasForeignKey(d => d.CalificacionId)
                .HasConstraintName("evalua_calificacion_id_fkey");

            entity.HasOne(d => d.Servicio).WithMany(p => p.Evaluas)
                .HasForeignKey(d => d.ServicioId)
                .HasConstraintName("evalua_servicio_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Evaluas)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("evalua_usuario_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Evaluas)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("evalua_venta_id_fkey");
        });

        modelBuilder.Entity<Interactua>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.MensajeId, e.VentaId }).HasName("interactua_pkey");

            entity.ToTable("interactua");

            entity.HasIndex(e => e.VentaId, "idx_interactua_venta");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.MensajeId).HasColumnName("mensaje_id");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");

            entity.HasOne(d => d.Mensaje).WithMany(p => p.Interactuas)
                .HasForeignKey(d => d.MensajeId)
                .HasConstraintName("interactua_mensaje_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Interactuas)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("interactua_usuario_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Interactuas)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("interactua_venta_id_fkey");
        });

        modelBuilder.Entity<Inventario>(entity =>
        {
            entity.HasKey(e => e.Idinventario).HasName("inventario_pkey");

            entity.ToTable("inventario");

            entity.Property(e => e.Idinventario).HasColumnName("idinventario");
            entity.Property(e => e.Nombre)
                .HasMaxLength(30)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Mensaje>(entity =>
        {
            entity.HasKey(e => e.Idmensaje).HasName("mensaje_pkey");

            entity.ToTable("mensaje");

            entity.Property(e => e.Idmensaje).HasColumnName("idmensaje");
            entity.Property(e => e.Contenido)
                .HasMaxLength(500)
                .HasColumnName("contenido");
            entity.Property(e => e.Fechaenvio)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fechaenvio");
            entity.Property(e => e.Leido).HasColumnName("leido");
        });

        modelBuilder.Entity<Metodopago>(entity =>
        {
            entity.HasKey(e => e.Idmetodopago).HasName("metodopago_pkey");

            entity.ToTable("metodopago");

            entity.Property(e => e.Idmetodopago).HasColumnName("idmetodopago");
            entity.Property(e => e.Nombre)
                .HasMaxLength(20)
                .HasColumnName("nombre");
            entity.Property(e => e.Tipo)
                .HasMaxLength(10)
                .HasColumnName("tipo");
            entity.Property(e => e.Ultimosdigitos).HasColumnName("ultimosdigitos");
        });

        modelBuilder.Entity<Ofertum>(entity =>
        {
            entity.HasKey(e => e.Idoferta).HasName("oferta_pkey");

            entity.ToTable("oferta");

            entity.HasIndex(e => new { e.Fechainicio, e.Fechafin }, "idx_oferta_fechas");

            entity.Property(e => e.Idoferta).HasColumnName("idoferta");
            entity.Property(e => e.Fechafin).HasColumnName("fechafin");
            entity.Property(e => e.Fechainicio).HasColumnName("fechainicio");
        });

        modelBuilder.Entity<Preguntum>(entity =>
        {
            entity.HasKey(e => e.Idpregunta).HasName("pregunta_pkey");

            entity.ToTable("pregunta");

            entity.Property(e => e.Idpregunta).HasColumnName("idpregunta");
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.Fecha)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");
            entity.Property(e => e.Pregunta)
                .HasMaxLength(300)
                .HasColumnName("pregunta");
        });

        modelBuilder.Entity<Produce>(entity =>
        {
            entity.HasKey(e => new { e.ClienteId, e.VentaId, e.ProductoId, e.CalificacionId }).HasName("produce_pkey");

            entity.ToTable("produce");

            entity.HasIndex(e => e.ProductoId, "idx_produce_producto");

            entity.Property(e => e.ClienteId)
                .HasMaxLength(10)
                .HasColumnName("cliente_id");
            entity.Property(e => e.VentaId).HasColumnName("venta_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.CalificacionId).HasColumnName("calificacion_id");

            entity.HasOne(d => d.Calificacion).WithMany(p => p.Produces)
                .HasForeignKey(d => d.CalificacionId)
                .HasConstraintName("produce_calificacion_id_fkey");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Produces)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("produce_cliente_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Produces)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("produce_producto_id_fkey");

            entity.HasOne(d => d.Venta).WithMany(p => p.Produces)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("produce_venta_id_fkey");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.Idbien).HasName("producto_pkey");

            entity.ToTable("producto");

            entity.HasIndex(e => e.EmprendedorId, "idx_producto_emprendedor");

            entity.HasIndex(e => new { e.Fechainicio, e.Fechafin }, "idx_producto_fechas");

            entity.HasIndex(e => e.Nombre, "idx_producto_nombre");

            entity.Property(e => e.Idbien).HasColumnName("idbien");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Caracteristicas)
                .HasColumnType("jsonb")
                .HasColumnName("caracteristicas");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .HasColumnName("descripcion");
            entity.Property(e => e.EmprendedorId)
                .HasMaxLength(10)
                .HasColumnName("emprendedor_id");
            entity.Property(e => e.Fechafin).HasColumnName("fechafin");
            entity.Property(e => e.Fechainicio).HasColumnName("fechainicio");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .HasColumnName("nombre");
            entity.Property(e => e.Restriccionedad).HasColumnName("restriccionedad");

            entity.HasOne(d => d.Emprendedor).WithMany(p => p.Productos)
                .HasForeignKey(d => d.EmprendedorId)
                .HasConstraintName("producto_emprendedor_id_fkey");

            entity.HasMany(d => d.Categoria).WithMany(p => p.Productos)
                .UsingEntity<Dictionary<string, object>>(
                    "Pertenece",
                    r => r.HasOne<Categorium>().WithMany()
                        .HasForeignKey("CategoriaId")
                        .HasConstraintName("pertenece_categoria_id_fkey"),
                    l => l.HasOne<Producto>().WithMany()
                        .HasForeignKey("ProductoId")
                        .HasConstraintName("pertenece_producto_id_fkey"),
                    j =>
                    {
                        j.HasKey("ProductoId", "CategoriaId").HasName("pertenece_pkey");
                        j.ToTable("pertenece");
                        j.HasIndex(new[] { "CategoriaId" }, "idx_pertenece_categoria");
                        j.IndexerProperty<int>("ProductoId").HasColumnName("producto_id");
                        j.IndexerProperty<int>("CategoriaId").HasColumnName("categoria_id");
                    });
        });

        modelBuilder.Entity<Provincium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("provincia_pkey");

            entity.ToTable("provincia");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.IdRegion).HasColumnName("id_region");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Superficie).HasColumnName("superficie");

            entity.HasOne(d => d.IdRegionNavigation).WithMany(p => p.Provincia)
                .HasForeignKey(d => d.IdRegion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("provincia_id_region_fkey");
        });

        modelBuilder.Entity<Rebaja>(entity =>
        {
            entity.HasKey(e => new { e.OfertaId, e.ProductoId }).HasName("rebaja_pkey");

            entity.ToTable("rebaja");

            entity.Property(e => e.OfertaId).HasColumnName("oferta_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Precio).HasColumnName("precio");

            entity.HasOne(d => d.Oferta).WithMany(p => p.Rebajas)
                .HasForeignKey(d => d.OfertaId)
                .HasConstraintName("rebaja_oferta_id_fkey");

            entity.HasOne(d => d.Producto).WithMany(p => p.Rebajas)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("rebaja_producto_id_fkey");
        });

        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("region_pkey");

            entity.ToTable("region");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Superficie).HasColumnName("superficie");
        });

        modelBuilder.Entity<Responde>(entity =>
        {
            entity.HasKey(e => new { e.UsuarioId, e.RespuestaId }).HasName("responde_pkey");

            entity.ToTable("responde");

            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");
            entity.Property(e => e.RespuestaId).HasColumnName("respuesta_id");
            entity.Property(e => e.PreguntaId).HasColumnName("pregunta_id");

            entity.HasOne(d => d.Pregunta).WithMany(p => p.Respondes)
                .HasForeignKey(d => d.PreguntaId)
                .HasConstraintName("responde_pregunta_id_fkey");

            entity.HasOne(d => d.Respuesta).WithMany(p => p.Respondes)
                .HasForeignKey(d => d.RespuestaId)
                .HasConstraintName("responde_respuesta_id_fkey");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Respondes)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("responde_usuario_id_fkey");
        });

        modelBuilder.Entity<Respuestum>(entity =>
        {
            entity.HasKey(e => e.Idrespuesta).HasName("respuesta_pkey");

            entity.ToTable("respuesta");

            entity.Property(e => e.Idrespuesta).HasColumnName("idrespuesta");
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.Fecha)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fecha");
            entity.Property(e => e.Respuesta)
                .HasMaxLength(300)
                .HasColumnName("respuesta");
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.HasKey(e => e.Idbien).HasName("servicio_pkey");

            entity.ToTable("servicio");

            entity.HasIndex(e => e.EmprendedorId, "idx_servicio_emprendedor");

            entity.HasIndex(e => new { e.Fechainicio, e.Fechafin }, "idx_servicio_fechas");

            entity.HasIndex(e => e.Nombre, "idx_servicio_nombre");

            entity.Property(e => e.Idbien).HasColumnName("idbien");
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Caracteristicas)
                .HasColumnType("jsonb")
                .HasColumnName("caracteristicas");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .HasColumnName("descripcion");
            entity.Property(e => e.EmprendedorId)
                .HasMaxLength(10)
                .HasColumnName("emprendedor_id");
            entity.Property(e => e.Fechafin).HasColumnName("fechafin");
            entity.Property(e => e.Fechainicio).HasColumnName("fechainicio");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .HasColumnName("nombre");
            entity.Property(e => e.Restriccionedad).HasColumnName("restriccionedad");

            entity.HasOne(d => d.Emprendedor).WithMany(p => p.Servicios)
                .HasForeignKey(d => d.EmprendedorId)
                .HasConstraintName("servicio_emprendedor_id_fkey");

            entity.HasMany(d => d.Categoria).WithMany(p => p.Servicios)
                .UsingEntity<Dictionary<string, object>>(
                    "Corresponde",
                    r => r.HasOne<Categorium>().WithMany()
                        .HasForeignKey("CategoriaId")
                        .HasConstraintName("corresponde_categoria_id_fkey"),
                    l => l.HasOne<Servicio>().WithMany()
                        .HasForeignKey("ServicioId")
                        .HasConstraintName("corresponde_servicio_id_fkey"),
                    j =>
                    {
                        j.HasKey("ServicioId", "CategoriaId").HasName("corresponde_pkey");
                        j.ToTable("corresponde");
                        j.HasIndex(new[] { "CategoriaId" }, "idx_corresponde_categoria");
                        j.IndexerProperty<int>("ServicioId").HasColumnName("servicio_id");
                        j.IndexerProperty<int>("CategoriaId").HasColumnName("categoria_id");
                    });
        });

        modelBuilder.Entity<Telefono>(entity =>
        {
            entity.HasKey(e => e.Telefono1).HasName("telefono_pkey");

            entity.ToTable("telefono");

            entity.Property(e => e.Telefono1)
                .ValueGeneratedNever()
                .HasColumnName("telefono");
            entity.Property(e => e.UsuarioId)
                .HasMaxLength(10)
                .HasColumnName("usuario_id");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Telefonos)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("telefono_usuario_id_fkey");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Run).HasName("usuario_pkey");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.Apellido1, "idx_usuario_apellido");

            entity.Property(e => e.Run)
                .HasMaxLength(10)
                .HasColumnName("run");
            entity.Property(e => e.Apellido1)
                .HasMaxLength(20)
                .HasColumnName("apellido1");
            entity.Property(e => e.Apellido2)
                .HasMaxLength(20)
                .HasColumnName("apellido2");
            entity.Property(e => e.Clave)
                .HasMaxLength(100)
                .HasColumnName("clave");
            entity.Property(e => e.Fechanac).HasColumnName("fechanac");
            entity.Property(e => e.Fecharegistro)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("fecharegistro");
            entity.Property(e => e.Nombre1)
                .HasMaxLength(20)
                .HasColumnName("nombre1");
            entity.Property(e => e.Nombre2)
                .HasMaxLength(20)
                .HasColumnName("nombre2");

            entity.HasMany(d => d.Direccions).WithMany(p => p.Usuarios)
                .UsingEntity<Dictionary<string, object>>(
                    "Posee",
                    r => r.HasOne<Direccion>().WithMany()
                        .HasForeignKey("DireccionId")
                        .HasConstraintName("posee_direccion_id_fkey"),
                    l => l.HasOne<Usuario>().WithMany()
                        .HasForeignKey("UsuarioId")
                        .HasConstraintName("posee_usuario_id_fkey"),
                    j =>
                    {
                        j.HasKey("UsuarioId", "DireccionId").HasName("posee_pkey");
                        j.ToTable("posee");
                        j.IndexerProperty<string>("UsuarioId")
                            .HasMaxLength(10)
                            .HasColumnName("usuario_id");
                        j.IndexerProperty<int>("DireccionId").HasColumnName("direccion_id");
                    });
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.Idventa).HasName("venta_pkey");

            entity.ToTable("venta");

            entity.HasIndex(e => e.MetodopagoId, "idx_venta_metodopago");

            entity.Property(e => e.Idventa).HasColumnName("idventa");
            entity.Property(e => e.Descuento).HasColumnName("descuento");
            entity.Property(e => e.Estadopago)
                .HasMaxLength(20)
                .HasColumnName("estadopago");
            entity.Property(e => e.Fechaventa)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("fechaventa");
            entity.Property(e => e.Iva).HasColumnName("iva");
            entity.Property(e => e.MetodopagoId).HasColumnName("metodopago_id");
            entity.Property(e => e.Totalconiva).HasColumnName("totalconiva");
            entity.Property(e => e.Totalsiniva).HasColumnName("totalsiniva");

            entity.HasOne(d => d.Metodopago).WithMany(p => p.Venta)
                .HasForeignKey(d => d.MetodopagoId)
                .HasConstraintName("venta_metodopago_id_fkey");

            entity.HasMany(d => d.Despachos).WithMany(p => p.Venta)
                .UsingEntity<Dictionary<string, object>>(
                    "Requiere",
                    r => r.HasOne<Despacho>().WithMany()
                        .HasForeignKey("DespachoId")
                        .HasConstraintName("requiere_despacho_id_fkey"),
                    l => l.HasOne<Ventum>().WithMany()
                        .HasForeignKey("VentaId")
                        .HasConstraintName("requiere_venta_id_fkey"),
                    j =>
                    {
                        j.HasKey("VentaId", "DespachoId").HasName("requiere_pkey");
                        j.ToTable("requiere");
                        j.IndexerProperty<int>("VentaId").HasColumnName("venta_id");
                        j.IndexerProperty<int>("DespachoId").HasColumnName("despacho_id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
