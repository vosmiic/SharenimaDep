using Sharenima.Models;

namespace Sharenima.Helpers; 

public class InstanceHelper {
    public static Instance? GetInstanceByName(MainContext mainContext, string instanceName) {
        return mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);
    }
}