#!/bin/bash

# Script to link nestjs-trpc-v2 locally for development

echo "🔗 Setting up local development link for nestjs-trpc-v2..."
echo ""

cd packages/nestjs-trpc-v2

echo "📦 Creating global pnpm link..."
pnpm link --global

echo ""
echo "✅ Link created! Now run this in your app:"
echo ""
echo "  cd /path/to/your/app"
echo "  pnpm link --global nestjs-trpc-v2"
echo ""
echo "🔨 To start development mode (auto-rebuild on changes):"
echo "  pnpm run start:dev"
echo ""
echo "🔓 To unlink later:"
echo "  pnpm unlink --global nestjs-trpc-v2 (in this directory)"
echo "  pnpm unlink nestjs-trpc-v2 && pnpm install --force (in your app)"
