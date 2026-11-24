using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("interactua")]
	[PrimaryKey(nameof(usuario_id), nameof(mensaje_id), nameof(venta_id))]
	public class Interactua
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int mensaje_id { get; set; }
		[ForeignKey("mensaje_id")]
		public Mensaje? Mensaje { get; set; }
		
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
	}
}
