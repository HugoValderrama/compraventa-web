using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("comentario")]
	public class Comentario
	{
		[Key]
		public int idcalificacion { get; set; }
		
		public string comentario { get; set; }

		public int puntuacion { get; set; }
	}
}
