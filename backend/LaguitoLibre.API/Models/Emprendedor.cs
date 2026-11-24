using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("emprendedor")]
	public class Emprendedor
	{
		[Key]
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }

		public string paginaweb { get; set; }

		public string empresa_id { get; set; }
		[ForeignKey("empresa_id")]
		public Empresa? Empresa { get; set; }
	}
}
