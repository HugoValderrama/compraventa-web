using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("evalua")]
	public class Evalua
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int calificacion_id { get; set; }
		[ForeignKey("calificacion_id")]
		public Calificacion? Calificacion { get; set; }
		
		public int venta_id { get; set; }
		[ForeignKey("venta_id")]
		public Venta? Venta { get; set; }
		
		public int servicio_id { get; set; }
		[ForeignKey("servicio_id")]
		public Servicio? Servicio { get; set; }
	}
}
