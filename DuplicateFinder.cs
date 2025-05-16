namespace Test4App;
public class DuplicateFinder {
    public static bool HasDuplicates(int[] array) {
        if (array == null || array.Length == 0) return false;

        var seen = new HashSet<int>();
        
        foreach (int num in array) {
            if (seen.Contains(num)) return true;
                
            seen.Add(num);
        }
        
        return false;
    }
}