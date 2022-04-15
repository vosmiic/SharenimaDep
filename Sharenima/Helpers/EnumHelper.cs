using System.ComponentModel;
using System.Reflection;

namespace Sharenima.Helpers; 

public class EnumHelper {
    public static string GetEnumDescription(Enum @enum) {
        return @enum.GetType()
            .GetMember(@enum.ToString())
            .First()
            .GetCustomAttribute<DescriptionAttribute>()?
            .Description ?? @enum.ToString();
    }
}