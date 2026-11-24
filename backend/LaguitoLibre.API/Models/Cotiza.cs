using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("cotiza")]
	public class Cotiza
	{
		public int cotizacion_id { get; set; }
		[ForeignKey("cotizacion_id")]
		public Cotizacion? Cotizacion { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
	}
}
