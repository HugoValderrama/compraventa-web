using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("inventario")]
	public class Inventario
	{
		[Key]
		public int idinventario { get; set; }

		public string nombre { get; set; }
	}
}
