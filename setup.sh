#!/bin/bash

# DeliverEase Quick Setup Script
# This script will set up the development environment

echo "🚀 DeliverEase Quick Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your Supabase credentials:"
    echo "   - EXPO_PUBLIC_SUPABASE_URL"
    echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "   Get these from: https://app.supabase.com"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=========================="
echo "✨ Setup Complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Supabase:"
echo "   - Create a Supabase project at https://supabase.com"
echo "   - Run the SQL from 'supabase-schema.sql' in Supabase SQL Editor"
echo "   - Update .env with your credentials"
echo ""
echo "2. Start the app:"
echo "   npm run dev"
echo ""
echo "3. Test with demo accounts:"
echo "   Restaurant: restaurant@demo.com / demo123"
echo "   Driver: driver@demo.com / demo123"
echo "   Dispatcher: dispatcher@demo.com / demo123"
echo "   Admin: admin@demo.com / demo123"
echo ""
echo "📚 For detailed setup instructions, see: SETUP_GUIDE.md"
echo ""
