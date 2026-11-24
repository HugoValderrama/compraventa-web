using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("compra")]
	[PrimaryKey(nameof(venta_id), nameof(producto_id))]
	public class Compra
	{
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public string cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }

		public DateTime fecha { get; set; }

		public int cantidad { get; set; }
		
		public string nota { get; set; }
	}
}
