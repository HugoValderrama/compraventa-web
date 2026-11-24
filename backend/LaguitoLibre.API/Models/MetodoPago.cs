using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("metodopago")]
	public class MetodoPago
	{
		[Key]
		public int idmetodopago { get; set; }

		public string nombre { get; set; }

		public string tipo { get; set; }

		public int ultimosdigitos { get; set; }
	}
}
