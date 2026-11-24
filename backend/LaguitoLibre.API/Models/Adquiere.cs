using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("adquiere")]
	public class Adquiere
	{
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
		
		public string cliente_id { get; set; }
		[ForeignKey("cliente_id")]
		public Cliente? Cliente { get; set; }

		public DateTime fecha { get; set; }

		public int cantidad { get; set; }
		
		public string nota { get; set; }
	}
}
