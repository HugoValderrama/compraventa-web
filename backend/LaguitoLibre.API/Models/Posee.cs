using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("posee")]
	[PrimaryKey(nameof(usuario_id), nameof(direccion_id))]
	public class Posee
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int direccion_id { get; set; }
		[ForeignKey("direccion_id")]
		public Direccion? Direccion { get; set; }
	}
}
