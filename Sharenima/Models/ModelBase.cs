using System.ComponentModel.DataAnnotations;

namespace Sharenima.Models; 

public class ModelBase {
    [Key]
    public int Id { get; set; }
}