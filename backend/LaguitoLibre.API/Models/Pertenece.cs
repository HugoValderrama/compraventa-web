using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("pertenece")]
	[PrimaryKey(nameof(producto_id), nameof(categoria_id))]
	public class Pertenece
	{
		public string producto_id { get; set; }
		[ForeignKey("producto_id")]
		public Producto? Producto { get; set; }
		
		public string categoria_id { get; set; }
		[ForeignKey("categoria_id")]
		public Caterogia? Categoria { get; set; }
	}
}
