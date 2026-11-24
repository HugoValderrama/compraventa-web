using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("servicio")]
	public class Servicio
	{
		[Key]
		public int idbien { get; set; }

		public string nombre { get; set; }

		public string descripcion { get; set; }

		public bool restriccionedad { get; set; }
		
		public string emprendedor_id { get; set; }
		[ForeignKey("emprendedor_id")]
		public Emprendedor? Emprendedor { get; set; }

		public DateOnly fechainicio { get; set; }

		public DateOnly fechafin { get; set; }
		
		public string caracteristicas { get; set; }
		
		public bool activo { get; set; }
	}
}
