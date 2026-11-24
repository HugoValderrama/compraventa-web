using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("contiene")]
	[PrimaryKey(nameof(inventario_id), nameof(producto_id))]
	public class Contiene
	{
		public int inventario_id { get; set; }
		[ForeignKey("inventario_id")]
		public Inventario? Inventario { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Servicio? Servicio { get; set; }
		
		public int stock { get; set; }
	}
}
