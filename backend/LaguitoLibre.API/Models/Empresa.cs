using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("empresa")]
	public class Empresa
	{
		[Key]
		public string rut { get; set; }

		public string razonsocial { get; set; }

		public string giro { get; set; }

		public string paginaweb { get; set; }

		public string direccionlocal { get; set; }
	}
}
