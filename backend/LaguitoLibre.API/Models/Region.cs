using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("region")]
	public class Region
	{
		[Key]
		public int id { get; set; }

		public string nombre { get; set; }

		public int superficie { get; set; }
	}
}
