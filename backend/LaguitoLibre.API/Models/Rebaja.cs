using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("rebaja")]
	public class Rebaja
	{
		public int oferta_id { get; set; }
		[ForeignKey("oferta_id")]
		public Oferta? Oferta { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public int precio { get; set; }
		
		public bool activo { get; set; }
	}
}
