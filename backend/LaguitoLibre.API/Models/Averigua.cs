using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("averigua")]
	public class Averigua
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int pregunta_id { get; set; }
		[ForeignKey("pregunta_id")]
		public Pregunta? Pregunta { get; set; }
		
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
	}
}
