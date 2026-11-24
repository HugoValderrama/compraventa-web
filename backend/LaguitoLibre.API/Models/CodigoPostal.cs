using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("codigopostal")]
	public class CodigoPostal
	{
		[Key]
		public int codigopostal { get; set; }

		public int comuna_id { get; set; }
		[ForeignKey("comuna_id")]
		public Comuna? Comuna{ get; set; }
	}
}
