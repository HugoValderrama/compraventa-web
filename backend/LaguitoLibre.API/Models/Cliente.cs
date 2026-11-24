using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("cliente")]
	public class Cliente
	{
		[Key]
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }

		public decimal descuento { get; set; }

		public DateOnly fechadescuento { get; set; }
	}
}
