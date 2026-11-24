using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("categoria")]
	public class Categoria
	{
		[Key]
		public int idcategoria { get; set; }

		public string nombre { get; set; }

		public int categoriapadre_id { get; set; }
		// PONER EN EL DBCONTEXT REFERENCIA A CLAVE PRIMARIA
	}
}
