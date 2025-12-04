export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          We are dedicated to providing exceptional career development and
          training services to help individuals reach their professional goals.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Excellence in education and training</li>
          <li>Commitment to student success</li>
          <li>Innovation and continuous improvement</li>
          <li>Integrity and transparency</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-700">
          Have questions? We{"'"}d love to hear from you. Get in touch with our
          team today.
        </p>
      </section>
    </div>
  );
}
