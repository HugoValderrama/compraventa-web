using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("direccion")]
	public class Direccion
	{
		[Key]
		public int iddireccion { get; set; }

		public string calle { get; set; }

		public int numero { get; set; }

		public string departamento { get; set; }

		public int codigopostal { get; set; }
		[ForeignKey("codigopostal")]
		public CodigoPostal? CodigoPostal { get; set; }
	}
}
