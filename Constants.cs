namespace Test4App;
static class Constants {
    internal static readonly string SqlUrl;
    internal static int HInSecForCache = 60 * 60;
    internal static int ThirtyDInSecForCache = HInSecForCache * 24 * 30;

    static Constants() {
#if RELEASE
#elif DEBUG
        HInSecForCache = 0;
        ThirtyDInSecForCache = 0;
#endif
    }
}
