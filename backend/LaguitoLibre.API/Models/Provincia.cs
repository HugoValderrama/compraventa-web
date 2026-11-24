using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("provincia")]
	public class Provincia
	{
		[Key]
		public int id { get; set; }

		public string nombre { get; set; }

		public int superficie { get; set; }

		public int id_region { get; set; }
		[ForeignKey("id_region")]
		public Region? Region { get; set; }
	}
}
