using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("devuelve")]
	[PrimaryKey(nameof(producto_id), nameof(devolucion_id))]
	public class Devuelve
	{
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public int devolucion_id { get; set; }
		[ForeignKey("devolucion_id")]
		public Devolucion? Devolucion { get; set; }
		
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public string cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }
	}
}
