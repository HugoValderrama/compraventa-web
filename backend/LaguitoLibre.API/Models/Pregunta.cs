using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("pregunta")]
	public class Pregunta
	{
		[Key]
		public int idpregunta { get; set; }
		
		public string pregunta { get; set; }

		public bool estado { get; set; }
		
		public DateOnly fecha { get; set; }
	}
}
