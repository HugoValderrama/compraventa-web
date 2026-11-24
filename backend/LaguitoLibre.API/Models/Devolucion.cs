using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("devolucion")]
	public class Devolucion
	{
		[Key]
		public int iddevolucion { get; set; }
		
		public string motivo { get; set; }

		public bool estado { get; set; }
		
		public int montoreembolso { get; set; }
	}
}
