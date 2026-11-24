using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("presupuesta")]
	[PrimaryKey(nameof(cotizacion_id), nameof(servicio_id))]
	public class Presupuesta
	{
		public int cotizacion_id { get; set; }
		[ForeignKey("cotizacion_id")]
		public Cotizacion? Cotizacion { get; set; }
		
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
	}
}
