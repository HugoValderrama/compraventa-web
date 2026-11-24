using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("produce")]
	public class Produce
	{
		public string cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }
		
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public int calificacion_id { get; set; }
		[ForeignKey("calificacion_id")]
		public Calificacion? Calificacion { get; set; }
	}
}
