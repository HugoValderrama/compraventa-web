using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("desea")]
	public class Desea
	{
		public string cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
	}
}
