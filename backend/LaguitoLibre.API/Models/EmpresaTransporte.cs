using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("empresatransporte")]
	public class EmpresaTransporte
	{
		[Key]
		public string rut { get; set; }

		public string razonsocial { get; set; }

		public int telefonocontacto { get; set; }
	}
}
