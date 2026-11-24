using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("cotizacion")]
	public class Cotizacion
	{
		[Key]
		public int idcotizacion { get; set; }
		
		public DateOnly validez { get; set; }
		
		public string estado { get; set; }

		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }

		public int cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }

		public DateOnly fecha { get; set; }
		
		public int precio { get; set; }
	}
}
