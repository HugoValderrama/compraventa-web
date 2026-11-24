using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("venta")]
	public class Venta
	{
		[Key]
		public int idventa { get; set; }

		public int totalsiniva { get; set; }

		public int totalconiva { get; set; }
		
		public int iva { get; set; }
		
		public int descuento { get; set; }

		public int metodopago_id { get; set; }
		[ForeignKey("metodopago_id")]
		public MetodoPago? MetodoPago { get; set; }
		
		public string estadopago { get; set; }
	}
}
