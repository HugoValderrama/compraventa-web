using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("oferta")]
	public class Oferta
	{
		[Key]
		public int idoferta { get; set; }

		public DateOnly fechainicio { get; set; }
		
		public DateOnly fechafin { get; set; }
	}
}
