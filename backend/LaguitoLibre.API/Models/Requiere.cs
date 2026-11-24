using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("requiere")]
	public class Requiere
	{
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public int despacho_id { get; set; }
		[ForeignKey("despacho_id")]
		public Despacho? Despacho { get; set; }
	}
}
