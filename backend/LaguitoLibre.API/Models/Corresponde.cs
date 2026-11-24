using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("corresponde")]
	[PrimaryKey(nameof(servicio_id), nameof(categoria_id))]
	public class Corresponde
	{
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
		
		public int categoria_id { get; set; }
		[ForeignKey("categoria_id")]
		public Caterogia? Categoria { get; set; }
	}
}
