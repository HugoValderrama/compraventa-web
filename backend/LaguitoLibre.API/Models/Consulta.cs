using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("consulta")]
	public class Consulta
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public int pregunta_id { get; set; }
		[ForeignKey("pregunta_id")]
		public Pregunta? Pregunta { get; set; }
	}
}
