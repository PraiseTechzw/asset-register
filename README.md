# Zim Open University Asset Register

A modern, comprehensive asset management and tracking application designed for Zim Open University.

## Features

- **Asset Listing & Search**: Efficiently manage and locate assets.
- **QR Code Scanning**: Rapidly identify and access asset details using built-in QR code scanning (via `html5-qrcode`).
- **Data Visualization**: Gain insights into your assets with interactive charts (via `recharts`).
- **Secure Authentication**: Built-in login and registration with token-based authentication.
- **Mobile Responsive**: Access and manage assets on the go.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Database**: [SQLite](https://sqlite.org) (via `better-sqlite3`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://framer.com/motion)
- **Icons**: [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PraiseTechzw/asset-register.git
   cd asset-register
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment:
   Create a `.env` file in the root directory (refer to `.env.example`).

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For any support requests, please contact [support@example.com](mailto:support@example.com).
