using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("mensaje")]
	public class Mensaje
	{
		[Key]
		public int idmensaje { get; set; }
		
		public string contenido { get; set; }

		public DateTime fechaenvio { get; set; }
		
		public bool leido { get; set; }
	}
}
