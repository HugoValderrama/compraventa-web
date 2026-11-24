using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("usuario")]
	public class Usuario
	{
		[Key]
		public string run { get; set; }

		public string nombre1 { get; set; }

		public string nombre2 { get; set; }

		public string apellido1 { get; set; }

		public string apellido2 { get; set; }

		public string clave { get; set; }

		public DateOnly fechanac { get; set; }

		public DateOnly fecharegistro { get; set; }
	}
}
