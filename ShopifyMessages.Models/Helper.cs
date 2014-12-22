using System.Configuration;
using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;

namespace ShopifyMessages.Core
{
    public class Helper
    {
        public static string FileUrl(string path)
        {
            return ConfigurationManager.AppSettings["AppPath"] + path;
        }

        public static string FileAsString(string path)
        {
            using (var sr = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + path))
            {
                return sr.ReadToEnd();
            }
        }

        public static T Clone<T>(T source)
        {
            if (!typeof(T).IsSerializable)
            {
                throw new ArgumentException("The type must be serializable.", "source");
            }

            if (ReferenceEquals(source, null))
            {
                return default(T);
            }

            IFormatter formatter = new BinaryFormatter();
            Stream stream = new MemoryStream();
            using (stream)
            {
                formatter.Serialize(stream, source);
                stream.Seek(0, SeekOrigin.Begin);
                return (T)formatter.Deserialize(stream);
            }
        }
    }
}
