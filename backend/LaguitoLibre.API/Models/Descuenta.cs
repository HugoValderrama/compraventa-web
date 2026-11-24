using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("descuenta")]
	[PrimaryKey(nameof(oferta_id), nameof(servicio_id))]
	public class Descuenta
	{
		public int oferta_id { get; set; }
		[ForeignKey("oferta_id")]
		public Oferta? Oferta { get; set; }
		
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
		
		public int precio { get; set; }
	}
}
