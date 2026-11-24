using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("pregunta")]
	public class Pregunta
	{
		[Key]
		public int idrespuesta { get; set; }
		
		public string respuesta { get; set; }

		public bool estado { get; set; }
		
		public DateTime fecha { get; set; }
	}
}
