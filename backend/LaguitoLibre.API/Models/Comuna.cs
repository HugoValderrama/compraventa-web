using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("comuna")]
	public class Comuna
	{
		[Key]
		public int id { get; set; }

		public string nombre { get; set; }

		public int superficie { get; set; }

		public int id_provincia { get; set; }
		[ForeignKey("id_provincia")]
		public Provincia? Provincia { get; set; }
	}
}
