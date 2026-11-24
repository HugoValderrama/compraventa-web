using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("contrata")]
	public class Contrata
	{
		public string empresatransporte_id { get; set; }
		[ForeignKey("empresatransporte_id")]
		public EmpresaTransporte? EmpresaTransporte { get; set; }
		
		public string empresa_id { get; set; }
		[ForeignKey("empresa_id")]
		public Empresa? Empresa { get; set; }
	}
}
